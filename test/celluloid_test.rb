#!/usr/bin/env ruby

require 'celluloid'

class Worker
  include Celluloid
  def initialize(q)
    @q=q
  end

  def execute
    @q.push( @q.last+1 )
  end

end

queue = Array.new
queue << 0
count = 1000


pool = Worker.pool(args:[queue])

0.upto(count).each{ pool.execute }

p queue

queue.each{ |i|
  puts i unless queue[i] == i
}


class FooBar
  include Celluloid

  def initialize
    execute_block


  end

  def execute_block

    puts Time.now.to_i
    sleep 3
  end

end

fb=FooBar.new

fb.every(1){ fb.async.execute_block unless fb.current }

sleep 20
