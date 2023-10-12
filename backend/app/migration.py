import database

def create_tables():
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