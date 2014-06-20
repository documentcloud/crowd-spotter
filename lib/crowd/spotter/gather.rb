require 'celluloid'
require 'cloud-crowd'
require 'open-uri'

module Crowd
  module Spotter
    class Gather
      include Celluloid

      def initialize
      end

      def with_connection
        ::CloudCrowd::Job.class_eval do
          self.establish_connection( Spotter.configuration['database'] )
          yield
          self.remove_connection
        end
      end


      def start_recording(start_at, buckets)

        @buckets = buckets

        # This is a hack postgresql function that moves job created_at/updated_at dates
        # to the future in order to provide "fresh" data for development.
        # It's implemented as a plpgsql function so there's no chance it'll be
        # available on production
        if ENV["RACK_ENV"]=="development"
          with_connection do
            CloudCrowd::Job.connection.execute 'select update_job_dates_func()'
          end
        end

        last_run = Time.now
        with_connection do
          CloudCrowd::Job.where("updated_at>?", start_at).order(:updated_at).find_each do | job |
            @buckets.record_history_on(job)
          end
        end

        Crowd::Spotter.log "History is available"

        record_stats_since(last_run)

        every( Crowd::Spotter::MINUTE_GRANULARITY * 60) do
          started_at = Time.now
          count = record_stats_since(last_run)
          puts "Recorded #{count} jobs since #{started_at} in #{Time.now-started_at} seconds"
          last_run =  started_at
        end

        every(1.hour) do
          Crowd::Spotter.log "Evicting data older than #{1.day.ago}"
          @buckets.evict_data_between(1.day.ago-2.hours, 1.day.ago)
        end
      end

      def record_stats_since(start_at)
        config = Spotter.configuration['uptime']
        url = "http://api.uptimerobot.com/getMonitors?monitors=#{config['monitorId']}&apiKey=#{config['apiKey']}" +
              "&logs=1&responseTimes=1&responseTimesAverage=30&customUptimeRatio=7-30&noJsonCallback=1&format=json"
        uptime = Oj.load open( url ).read
        @buckets.record_uptime( uptime['monitors']['monitor'].first )
        count = 0
        with_connection do
          CloudCrowd::Job.where("status in (?) or updated_at>?", CloudCrowd::INCOMPLETE, start_at).order(:updated_at).find_each do | job |
            # We subdivide every hour into 5 minute segments
            @buckets.record_latest(job,start_at)
            count +=1
          end
        end
        count
      end


    end
  end
end
