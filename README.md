# Crowd::Spotter

Crowd Spotter monitors the performance of [Cloud Crowd](http://wiki.github.com/documentcloud/cloud-crowd).  It periodically gathers statistics on Job Pending/Processing/Completion counts and displays them on an webpage as an interactive dashboard.

## Installation

Add this line to your application's Gemfile:

    gem 'crowd-spotter'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install crowd-spotter

## Usage

Crowd::Spotter is implemented as a rack application.  Accordingly it can be ran stand-alone with an example config.ru.

   require 'crowd/spotter'
   run Crowd::Spotter::Application


Or mounted into a Rails application with route.rb:

   require 'crowd/spotter'
   Rails.application.routes.draw do
       mount Crowd::Spotter::Engine, at: "/stats"
   end

It's also possible to use Rack::Cascade

## Contributing

1. Fork it ( http://github.com/<my-github-username>/crowd-spotter/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
