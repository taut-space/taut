

function readAll(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

function getNames(tmpdir)
    io.write("Loading names...")
    
    local idx, theFiles, popen = 0, {}, io.popen
    local pfile = popen('ls -1 "'..tmpdir..'"')
    for filename in pfile:lines() do
        idx = idx + 1
        theFiles[idx] = tmpdir..filename
    end
    pfile:close()
    print("done")
    return theFiles
end

function getBodies(names)
    local theBodies = {}
    io.write("Loading images...")
    for idx,filename in pairs(names) do
        theBodies[idx] = readAll(filename)
    end
    print("done")
    return theBodies
end

fileNames = getNames('tmp/')
fileBodies = getBodies(fileNames)

wrk.method = "POST"
wrk.headers["Content-Type"] = "application/octet-stream"
wrk.headers["Cookie"] = "FILLME"
math.randomseed(tonumber(tostring({}):sub(8))+os.time())

request = function()
    local idx = math.random(#fileNames)
    return wrk.format(wrk.method, wrk.path..string.gsub(fileNames[idx],"tmp/",""), wrk.headers, fileBodies[idx])
end
