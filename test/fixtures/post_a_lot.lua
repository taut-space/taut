

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
wrk.headers["Cookie"] = "scratchsessionsid=\".eJxVjz1vgzAQhv8Lc0ttY2PIlgxdGjVSh34t1hkf4AA2BdNIrfrfa0tZInm5e06P3_c321ZcHEyY7bJ1m3EJuAZc1DgO2V0W_IAuEinKktTIStkiZ0JWUDNWIAreEsO12e1Pj93T69vpk8ERq6_vwerzkb67ZvZRM_rOuns7RxOt8krkoo4vAgVb6FWKoKxJlBBCq5rIyMwZXOdVsBP-eJfy7SdcbAMPz3hRH34ZbgU9rH080oYB6JYy3tJC6IICQMmpZJRgYWQVZ5ScktQuVm28H2ySX6IQza1SQxP7p2Bphy7E34P1Lr-CNX_BebwuD9fjv3_FgW7g:1fRJ5j:4fiCKhfV_7K5XZsAg2lbyLmp3Ms\"; scratchcsrftoken=7AF6PrjcHsKhJqUq8sjKJdNoztGUgBhl"
math.randomseed(tonumber(tostring({}):sub(8))+os.time())

request = function()
    local idx = math.random(#fileNames)
    return wrk.format(wrk.method, wrk.path..string.gsub(fileNames[idx],"tmp/",""), wrk.headers, fileBodies[idx])
end
