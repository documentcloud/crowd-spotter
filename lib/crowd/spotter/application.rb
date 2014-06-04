require 'sinatra'

module Crowd
  module Spotter
    class Application < Sinatra::Base

      configure do
        Crowd::Spotter.startup
      end


      get '/' do
        "Hello, world!"
      end
    end
  end
end
