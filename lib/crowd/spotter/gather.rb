require 'celluloid'

module Crowd
  module Spotter
    class Gather
      include Celluloid

      def initialize
      end

      def history(start_at,stats)
        sleep 5
        0.upto(100).each{ |i| stats << { time:i, waiting: rand(i) } }
        puts "History is available"
      end

    end
  end
end
