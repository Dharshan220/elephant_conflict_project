import psycopg

REF = "zlcrynxxyxqdbvsqzmkl"
PWDS = ["DharshanE 200", "DharshanE200"]
HOSTS = [
    f"{REF}.supabase.co:5432",
    f"{REF}.supabase.co:6543",
]

for host in HOSTS:
    for pwd in PWDS:
        url = f"postgresql://postgres:{pwd}@{host}/postgres"
        try:
            conn = psycopg.connect(url, connect_timeout=10)
            cur = conn.execute("select version()")
            ver = cur.fetchone()[0]
            print(f"OK  {host} pwd={pwd!r}\n    {ver[:60]}")
            conn.close()
        except Exception as e:
            print(f"ERR {host} pwd={pwd!r}: {str(e)[:80]}")
