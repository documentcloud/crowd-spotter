module Crowd
  module Spotter
    class Supervisor

      include Celluloid
      trap_exit :actor_died

      def initialize(buckets)
        @buckets = buckets
        Gather.supervise_as :gather
      end

      def startup
        gather = Actor[:gather]
        link gather
        start_at = Time.now-(86400*1)
        gather.async.start_recording(start_at, @buckets)
      end

      def actor_died(actor, reason)
        Spotter.log "Gather thread died because of a #{reason.class}, restarting"
        sleep 0.1
        startup
      end
    end
  end
end
