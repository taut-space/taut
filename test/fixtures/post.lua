function readAll(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

wrk.method = "POST"
wrk.body   = readAll('./test/fixtures/a.png')
wrk.headers["Content-Type"] = "application/octet-stream"
wrk.headers["Cookie"] = ""

