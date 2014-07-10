require_relative 'buckets'
require_relative 'supervisor'
require 'celluloid/autostart'

module Crowd
  module Spotter
    class Statistics

      def initialize
        @buckets = Buckets.new
        Supervisor.new( @buckets ).startup
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
