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


      def history(start_at, buckets)

        @buckets = buckets

        # FIXME - REMOVE WHEN LEAVING DEVELOPMENT.
        # A plpgsql function is used so that there's no chance it will be available on production
        with_connection do
          CloudCrowd::Job.connection.execute 'select update_job_dates_func()'
        end

        self.record_stats_since(start_at)

        puts "History is available"
        last_run = Time.now
        every( 60 ) do # Crowd::Spotter::MINUTE_GRANULARITY * 60
          started_at = Time.now
          record_stats_since(last_run)
          puts "Recorded jobs since #{started_at} in #{Time.now-started_at} seconds"
          last_run =  started_at
        end
      end

      def record_stats_since(start_at)
        config = Spotter.configuration['uptime']
        url = "http://api.uptimerobot.com/getMonitors?monitors=#{config['monitorId']}&apiKey=#{config['apiKey']}&logs=1&responseTimes=1&responseTimesAverage=30&customUptimeRatio=7-30&noJsonCallback=1&format=json"
        uptime = Oj.load open( url ).read
        @buckets.record_uptime( uptime['monitors']['monitor'].first )

        with_connection do
          CloudCrowd::Job.where("updated_at>? and created_at<=now()", start_at).limit(10).order(:updated_at).find_each do | job |
            # We subdivide every hour into 5 minute segments
            @buckets.record(job)
          end
        end

      end


    end
  end
end
