import psycopg2
import time
import database

def create_tables():
    timeout_seconds = 60
    start_time = time.time()
    while True:
        try:
            conn = psycopg2.connect(
                host="db", port="5432", user="root", password="root", dbname="tracking"
            )
            conn.close()
            break
        except psycopg2.Error as e:
            print("Error: connecting the database retrying")

        current_time = time.time()
        elapsed_time = current_time - start_time

        if elapsed_time >= timeout_seconds:
            break
        time.sleep(2)
    
    with database.Database() as db:
        db.cursor.execute(f"""DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
    CREATE TYPE status AS ENUM ('to-read', 'in-progress', 'completed');
            END IF; END $$;
                            CREATE TABLE IF NOT EXISTS book (
                            id UUID PRIMARY KEY DEFAULT MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT)::UUID,
                            title  VARCHAR(255) NOT NULL,
                            file text NOT NULL,
                            status status DEFAULT 'to-read'
            )
        """)
        db.connection.commit()
        print("Tables are created successfully...")

if __name__ == "__main__":
    create_tables()