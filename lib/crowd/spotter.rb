require_relative "spotter/version"
require_relative "spotter/gather"
require_relative "spotter/statistics"

module Crowd
  module Spotter

    def self.startup
      @statistics = Statistics.new
    end

    def self.statistics
      @statistics.all
    end

  end
end

require_relative "spotter/application"
