require_relative 'buckets'
module Crowd
  module Spotter
    class Statistics

      def initialize
        @buckets = Buckets.new

        Gather.supervise_as :gather

        start_at = Time.now-(86400*1) # 86400 = 1 day
        Celluloid::Actor[:gather].async.start_recording(start_at, @buckets)
      end

      def most_recent
        @buckets.most_recent
      end

      def all
        @buckets.all
      end

    end
  end
end
