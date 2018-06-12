function readAll(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

wrk.method = "POST"
wrk.body   = readAll('./test/fixtures/a.png')
wrk.headers["Content-Type"] = "application/octet-stream"
wrk.headers["Cookie"] = "scratchsessionsid=\".eJxVjz1vgzAQhv8Lc0ttY2PIlgxdGjVSh34t1hkf4AA2BdNIrfrfa0tZInm5e06P3_c321ZcHEyY7bJ1m3EJuAZc1DgO2V0W_IAuEinKktTIStkiZ0JWUDNWIAreEsO12e1Pj93T69vpk8ERq6_vwerzkb67ZvZRM_rOuns7RxOt8krkoo4vAgVb6FWKoKxJlBBCq5rIyMwZXOdVsBP-eJfy7SdcbAMPz3hRH34ZbgU9rH080oYB6JYy3tJC6IICQMmpZJRgYWQVZ5ScktQuVm28H2ySX6IQza1SQxP7p2Bphy7E34P1Lr-CNX_BebwuD9fjv3_FgW7g:1fRJ5j:4fiCKhfV_7K5XZsAg2lbyLmp3Ms\"; scratchcsrftoken=7AF6PrjcHsKhJqUq8sjKJdNoztGUgBhl"

