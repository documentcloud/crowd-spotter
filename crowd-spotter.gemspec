# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'crowd/spotter/version'

Gem::Specification.new do |spec|
  spec.name          = "crowd-spotter"
  spec.version       = Crowd::Spotter::VERSION
  spec.authors       = ["Nathan Stitt", "Ted Han"]
  spec.email         = ['opensource@documentcloud.org']
  spec.summary       = %q{Gather statistics on Cloud Crowd performance}
  spec.description   = %q{Gathers statistics on Cloud Crowd performance and provides a monitoring dashboard}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "cloud-crowd", ">=0.7.3"
  spec.add_dependency "celluloid", "~>0.15.2"
  spec.add_dependency "sinatra", ">= 0.7.3"

  spec.add_development_dependency "bundler", "~> 1.5"
  spec.add_development_dependency "rake"
end
