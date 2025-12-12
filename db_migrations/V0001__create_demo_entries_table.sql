-- Создание таблицы для демо-записей
CREATE TABLE IF NOT EXISTS demo_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Добавление индекса для сортировки по дате
CREATE INDEX IF NOT EXISTS idx_demo_entries_created_at ON demo_entries(created_at DESC);