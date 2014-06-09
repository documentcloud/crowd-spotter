Totals = Struct.new(:completed, :started) do
  def self.create
     self.new 0, 0
  end
end

class Buckets

  def initialize
    @storage = Hash.new{ | h, segment | h[segment] = Totals.create }
  end

  def record(job)
    if job.complete?
      at(job.updated_at).completed+=1
    end
    at(job.created_at).started+=1
  end

  def at(time)
    # Returns a integer version of year, month, day, and 5 minute segment number
    # i.e. 4:39 pm on 2014-06-09 will return: 2014060907
    ts = ( time.strftime('%Y%m%d') + sprintf("%02d", time.min.divmod(5).first ) ).to_i
    @storage[ts]
  end

  def to_hash
    @storage
  end

end
