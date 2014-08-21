require_relative "spotter/version"
require_relative "spotter/gather"
require_relative "spotter/statistics"
require 'hashie/mash'

module Crowd
  module Spotter
    MINUTE_GRANULARITY = 5

    def self.startup
      @statistics = Statistics.new
    end

    def self.statistics
      @statistics
    end

    def self.configuration
      @configuration ||= Hashie::Mash.new( YAML.load(ERB.new(File.read("./config/config.yml")).result) )
    end

    def self.log( string )
      puts string
    end
  end
end

require_relative "spotter/application"
