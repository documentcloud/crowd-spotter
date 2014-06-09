require 'celluloid'
require 'cloud-crowd'
module Crowd
  module Spotter
    class Gather
      include Celluloid

      def initialize
      end

      def history(start_at,buckets)

        ::CloudCrowd::Job.class_eval do
          config_path = "./config/database.yml"
          configuration = YAML.load(ERB.new(File.read(config_path)).result)[ENV['RACK_ENV']]
          self.establish_connection(configuration)
        end

        

        CloudCrowd::Job.where("updated_at>?", start_at).order(:updated_at).find_each do | job |
          # We subdivide every hour into 5 minute segments
          buckets.record(job)
        end
        

        puts "History is available"
      end

    end
  end
end
