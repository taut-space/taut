function readAll(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

wrk.method = "POST"
wrk.body   = readAll('./test/fixtures/a.png')
wrk.headers["Content-Type"] = "application/octet-stream"
wrk.headers["Cookie"] = "scratchsessionsid=\".eJxVj09PwzAMxb9LzmvJWvJvN3YEgRBiB7hUTupuoW1StSmVQHx3HGmXSZZivefn_PzL1gXnACOyA3OxXS0i27EG1nRpstX4lpw911IaoclKuCQXY-9zYotzj-1twILrMeRU1jAk7yD5GMqrsZRvOA1X8Xgdpr2RGgpxITtQBhWR3FdWgTVCSqtrWddC2fYAxSm9CvDdp1-64hG_p-Pz-1Y8udOJ1gzx7EPhpwytSy1KYagy4QDhvMI5Y9NHO9Z-kRCb5Ef8iSHLDyPOxHX3glvzQZfd3nWB5UJDghsAvte6EgprVQmogFunuKLXcWmlFMrImv39A-OQb9U:1fO5zn:lSYJ2L4dIwgvHJQ1hOCiu3igWWs\"; scratchcsrftoken=NPGG93pIOxVKWsLy0qMX2KII4ekrrRAj;"

logfile = io.open("wrk.log", "w");
local cnt = 0;

response = function(status, header, body)
     logfile:write("status:" .. status .. "\n");
     cnt = cnt + 1;
     logfile:write("status:" .. status .. "\n" .. body .. "\n-------------------------------------------------\n");
end

done = function(summary, latency, requests)
     logfile:write("------------- SUMMARY -------------\n")
     print("Response count: ", cnt)
     logfile.close();
end
