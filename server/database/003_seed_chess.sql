INSERT INTO hobbies (name, slug, description, category)
VALUES ('Chess', 'chess', 'Learn practical chess techniques without information overload.', 'Games')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO hobby_levels (hobby_id, name, level_order, description)
SELECT h.id, level.name, level.level_order, level.description
FROM hobbies h CROSS JOIN (VALUES
  ('Beginner', 1, 'Learn legal moves, safe development, and basic tactics.'),
  ('Intermediate', 2, 'Calculate combinations and play complete positions.'),
  ('Advanced', 3, 'Deepen strategic planning and technical conversion.')
) AS level(name, level_order, description)
WHERE h.slug = 'chess'
ON CONFLICT (hobby_id, level_order) DO NOTHING;

INSERT INTO techniques (hobby_id, title, slug, description, difficulty_level, estimated_minutes, popularity_score, average_rating)
SELECT h.id, technique.title, technique.slug, technique.description, technique.difficulty, technique.minutes, technique.popularity, technique.rating
FROM hobbies h CROSS JOIN (VALUES
  ('Opening principles', 'opening-principles', 'Control the centre, develop pieces, and protect the king.', 1, 25, 95.0, 4.8),
  ('Piece development', 'piece-development', 'Activate every piece without wasting opening moves.', 1, 20, 92.0, 4.7),
  ('Basic tactical patterns', 'basic-tactical-patterns', 'Recognise forcing moves before calculating deeply.', 1, 30, 98.0, 4.9),
  ('Forks', 'forks', 'Attack two targets with one move.', 1, 25, 94.0, 4.8),
  ('Pins', 'pins', 'Restrict a piece because moving it exposes a more valuable target.', 2, 25, 90.0, 4.7),
  ('Checkmate patterns', 'checkmate-patterns', 'Recognise common mating nets around an exposed king.', 2, 35, 97.0, 4.9),
  ('Basic endgames', 'basic-endgames', 'Convert king-and-pawn and basic piece endings.', 2, 40, 88.0, 4.6),
  ('Game analysis', 'game-analysis', 'Review decisions and turn mistakes into practice targets.', 2, 30, 86.0, 4.8)
) AS technique(title, slug, description, difficulty, minutes, popularity, rating)
WHERE h.slug = 'chess'
ON CONFLICT (hobby_id, slug) DO NOTHING;

INSERT INTO technique_levels (technique_id, level_id)
SELECT t.id, l.id FROM techniques t JOIN hobbies h ON h.id = t.hobby_id JOIN hobby_levels l ON l.hobby_id = h.id
WHERE h.slug = 'chess' AND ((t.difficulty_level = 1 AND l.level_order = 1) OR (t.difficulty_level = 2 AND l.level_order IN (1,2)))
ON CONFLICT DO NOTHING;

INSERT INTO technique_prerequisites (technique_id, prerequisite_technique_id)
SELECT technique.id, prerequisite.id FROM techniques technique JOIN techniques prerequisite ON prerequisite.hobby_id = technique.hobby_id JOIN hobbies h ON h.id = technique.hobby_id
WHERE h.slug = 'chess' AND (technique.slug, prerequisite.slug) IN (('forks','basic-tactical-patterns'),('pins','basic-tactical-patterns'),('game-analysis','opening-principles'))
ON CONFLICT DO NOTHING;
