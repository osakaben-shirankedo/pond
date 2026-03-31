-- chat_rooms
INSERT OR IGNORE INTO chat_rooms (id, created_at, updated_at) VALUES
  ('cr-programming-01', datetime('now'), datetime('now')),
  ('cr-math-01',        datetime('now'), datetime('now')),
  ('cr-english-01',     datetime('now'), datetime('now')),
  ('cr-art-01',         datetime('now'), datetime('now')),
  ('cr-music-01',       datetime('now'), datetime('now')),
  ('cr-science-01',     datetime('now'), datetime('now'));

-- ikes (ike_name = field id)
INSERT OR IGNORE INTO ikes (id, ike_name, description, member_ids, chat_room_id, created_at, updated_at) VALUES
  ('ike-programming-01', 'programming', 'プログラミングを一緒に学ぶ池', '[]', 'cr-programming-01', datetime('now'), datetime('now')),
  ('ike-math-01',        'math',        '数学を一緒に学ぶ池',           '[]', 'cr-math-01',        datetime('now'), datetime('now')),
  ('ike-english-01',     'english',     '英語を一緒に学ぶ池',           '[]', 'cr-english-01',     datetime('now'), datetime('now')),
  ('ike-art-01',         'art',         'アートを一緒に学ぶ池',         '[]', 'cr-art-01',         datetime('now'), datetime('now')),
  ('ike-music-01',       'music',       '音楽を一緒に学ぶ池',           '[]', 'cr-music-01',       datetime('now'), datetime('now')),
  ('ike-science-01',     'science',     '科学を一緒に学ぶ池',           '[]', 'cr-science-01',     datetime('now'), datetime('now'));
