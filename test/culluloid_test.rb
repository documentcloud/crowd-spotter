require 'celluloid'
require 'timers'

timers = Timers.new

puts Thread.current.object_id
five_second_timer = timers.after(5) {
  puts "Take five"
  puts Thread.current.object_id
}

sleep 10
# Waits 5 seconds
timers.wait

# class Sheen
#   include Celluloid

#   def initialize(name)
#     @name = name
#   end

#   def set_status(status)
#     @status = status
#   end

#   def report
#     "#{@name} is #{@status}"
#   end
# end


# charlie = Sheen.new "Charlie Sheen"

# charlie.set_status "winning!"

# puts charlie.report

# charlie.async.set_status "asynchronously winning!"

# future = charlie.future.report

# puts 'Waiting result'

# puts future.value

