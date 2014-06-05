require "sinatra"
require 'oj'

module Crowd
  module Spotter
    class Application < Sinatra::Base

      configure do
        Crowd::Spotter.startup
      end

      get '/' do
        "Hello, world!"
      end

      get '/statistics' do
        content_type 'application/json'
        Oj.dump(Spotter.statistics)
      end

    end
  end
end
