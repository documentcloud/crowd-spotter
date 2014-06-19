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

        # This is a hack postgresql function that moves job created_at/updated_at dates
        # to the future in order to provide "fresh" data for development.
        # It's implemented as a plpgsql function so there's no chance it'll be
        # available on production
        if ENV["RACK_ENV"]=="development"
          with_connection do
            CloudCrowd::Job.connection.execute 'select update_job_dates_func()'
          end
        end

        self.record_stats_since(start_at)

        puts "History is available"
        last_run = Time.now
        every( 60 ) do # Crowd::Spotter::MINUTE_GRANULARITY * 60
          started_at = Time.now
          count = record_stats_since(last_run)
          puts "Recorded #{count} jobs since #{started_at} in #{Time.now-started_at} seconds"
          last_run =  started_at
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
          CloudCrowd::Job.where("updated_at>?", start_at).limit(10).order(:updated_at).find_each do | job |
            # We subdivide every hour into 5 minute segments
            @buckets.record(job)
            count +=1
          end
        end
        count
      end


    end
  end
end
