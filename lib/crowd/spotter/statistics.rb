require 'pry'
module Crowd
  module Spotter
    class Statistics

      def initialize
        @stats = []

        Gather.supervise_as :gather

        puts 'b4 history'
        Celluloid::Actor[:gather].async.history(300,@stats)

        puts 'af history'
#every(1.minute){ @gatherer.gather! }

      end

      def all
        @stats
      end
    end

  end
end
