environment ENV['SPOTTER_ENV'] || 'production'
daemonize

workers    1 # should be same number of your CPU core
threads    1, 6

pidfile    "tmp/spotter.pid"
stdout_redirect 'log/spotter.log', 'log/spotter-error.log', true
