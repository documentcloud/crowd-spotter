require_relative 'buckets'
module Crowd
  module Spotter
    class Statistics

      def initialize
        @stats = Buckets.new

        Gather.supervise_as :gather

        start_at = Time.now-(86400*3) # 86400 = 1 day
        Celluloid::Actor[:gather].async.history(start_at,@stats)
      end

      def all
        @stats.to_hash
      end

    end
  end
end
