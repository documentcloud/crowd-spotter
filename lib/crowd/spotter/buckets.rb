module Crowd
  module Spotter

    Totals = Struct.new(:completed, :started, :processing, :failures) do
      def self.create
        self.new 0, 0, 0, 0
      end
      members.each do | member |
        self.class_eval %Q{
      def #{member}!(count=1)
        self.#{member}+=count
        self
      end
        }
      end
    end

    class Buckets

      def initialize
        @uptime  = []
        @latency = []
        @available = true
        @cc = Hash.new{ | h, segment | h[segment] = Totals.create }
      end

      def uptime_ts( string )
        Time.strptime(string,'%m/%d/%Y %H:%M:%S').to_i * 1000
      end

      def record_uptime(uptime)
        @available = ( uptime['status'] != 2 )
        @uptime_percentages = uptime['customuptimeratio'].split('-')
        @uptime  = uptime['log'].map{ | event| [ uptime_ts(event['datetime']), event['type']=='2' ] }.sort_by(&:first)
        @uptime.push( [ Time.now.utc.to_i * 1000, @available ] )
        @latency = uptime['responsetime'].map{ |event| [ uptime_ts(event['datetime']), event['value'].to_i ] }.sort_by(&:first)
      end

      def record_history_on(job)
        if job.complete?
          record = at(job.updated_at).completed!
          record.failures! if job.failed?
        end
        at(job.created_at).started!

        # increment the processing count for all periods that the job was processing
        timestamps_between(job.created_at, job.updated_at) do |ts|
          at(ts).processing!
        end
      end

      def timestamps_between(start_time, end_time)
        current = start_time
        loop do
          yield current
          break if (current += Crowd::Spotter::MINUTE_GRANULARITY.minutes) > end_time
        end
      end

      def record_latest(job,start_at)
        # record only if it's freshly created
        if job.created_at > start_at
          at(job.created_at).started!
        end

        if job.complete?
          record = at(job.updated_at).completed!
          record.failures! if job.failed?
        else
          at(start_at).processing!
        end
      end

      def ts_for(time)
        sprintf("%s%02d",
          time.strftime('%Y%m%d%H'),
          time.min.divmod( Crowd::Spotter::MINUTE_GRANULARITY ).first * Crowd::Spotter::MINUTE_GRANULARITY
        ).to_i
      end

      def at(time)
        # Returns a integer version of year, month, day, and 5 minute segment number
        # i.e. 4:39 pm on 2014-06-09 will round down to nearest 5 minute segment, i.e. 201406091635
        @cc[ts_for(time)]
      end

      def for_dashboard( stats )
        stats.each_with_object({completed:[], started:[], processing:[], failures:[]}){ | kv, hash |
          ts =  DateTime.strptime(kv.first.to_s,'%Y%m%d%H%M').to_i * 1000
          kv.last.to_h.each{ |key,count| hash[key].push([ts,count]) }
        }.merge({
            'available' => @available,
            'uptime_percentages' => @uptime_percentages
        })
      end

      def all
        for_dashboard(@cc).merge({
          'uptime' => @uptime,
          'latency' => @latency
        })
      end

      def most_recent
        latest = Time.now
        loop do
          ts = ts_for(latest)
          break if @cc.has_key?(ts)
          latest -= Crowd::Spotter::MINUTE_GRANULARITY.minutes
        end
        ts = ts_for(latest)
        for_dashboard( Hash[ts, @cc[ts]] ).merge({
          'uptime' => @uptime.last,
          'latency' => @latency.last
        })
      end

      def evict_data_between(start,cutoff)
        timestamps_between(start,cutoff) do |ts|
          @cc.delete(ts)
        end
      end

    end

  end
end
