require "sinatra"
require 'oj'
require 'pathname'
require 'sass'
require 'compass'

module Crowd
  module Spotter
    class Application < Sinatra::Base

      configure do
        set :root, Pathname.new(__FILE__).dirname.join('../../../')
        Crowd::Spotter.startup
        
        Compass.configuration do |config|
          config.project_path = root #.join('public/css')
        end

      end

      get '/' do
        send_file File.join(settings.public_folder, 'index.html')
      end

      get '/statistics' do
        content_type 'application/json'
        Oj.dump(Spotter.statistics.to_hash, mode: :compat)
      end

      get '/css/:name.css' do
        content_type 'text/css', :charset => 'utf-8'
        scss(:"css/#{params[:name]}", Compass.sass_engine_options )
      end


    end
  end
end
