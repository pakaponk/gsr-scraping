CREATE EXTENSION pg_trgm;
CREATE EXTENSION btree_gin;
CREATE INDEX report_keyword_index 
   ON reports USING GIN (to_tsvector('english', keyword));
