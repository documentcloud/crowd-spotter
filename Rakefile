require "bundler/gem_tasks"
require 'rake/testtask'
require 'puma/control_cli'

Rake::TestTask.new do |t|
    t.libs << 'test'
    t.pattern = "test/*_test.rb"
end

task :development do
    ENV['SPOTTER_ENV']='development'
end

args = ['-F','config/puma.rb']

task :start do
    args.push('start')
    Puma::ControlCLI.new(args).run
end

task :stop do
    args.push('stop')
    Puma::ControlCLI.new(args).run
end
