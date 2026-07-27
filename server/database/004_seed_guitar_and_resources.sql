INSERT INTO hobbies (name, slug, description, category)
VALUES ('Guitar', 'guitar', 'Build practical guitar skills for playing complete songs with confidence.', 'Music')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO hobby_levels (hobby_id, name, level_order, description)
SELECT h.id, level.name, level.level_order, level.description
FROM hobbies h CROSS JOIN (VALUES
  ('Beginner', 1, 'Play clean chords and maintain a simple rhythm.'),
  ('Intermediate', 2, 'Expand rhythm, expression, repertoire, and ear skills.'),
  ('Advanced', 3, 'Develop improvisation, arrangement, and performance control.')
) AS level(name, level_order, description)
WHERE h.slug = 'guitar'
ON CONFLICT (hobby_id, level_order) DO NOTHING;

INSERT INTO techniques (hobby_id, title, slug, description, difficulty_level, estimated_minutes, popularity_score, average_rating)
SELECT h.id, technique.title, technique.slug, technique.description, technique.difficulty, technique.minutes, technique.popularity, technique.rating
FROM hobbies h CROSS JOIN (VALUES
  ('Clean chord changes', 'clean-chord-changes', 'Switch between common open chords without breaking the rhythm.', 1, 25, 98.0, 4.9),
  ('Pocket strumming', 'pocket-strumming', 'Maintain a relaxed down-down-up groove through a complete progression.', 1, 25, 95.0, 4.8),
  ('Muting unwanted strings', 'muting-unwanted-strings', 'Use both hands to keep chord and rhythm playing clean.', 1, 20, 88.0, 4.7),
  ('Dynamic control', 'dynamic-control', 'Change touch and volume without losing time.', 2, 20, 86.0, 4.7),
  ('Suspended chord movement', 'suspended-chord-movement', 'Add musical movement with sus2 and sus4 variations.', 2, 20, 82.0, 4.6),
  ('Play a complete song', 'play-a-complete-song', 'Combine chords, rhythm, recovery, and structure from start to finish.', 2, 40, 100.0, 4.9),
  ('Learn a progression by ear', 'learn-progression-by-ear', 'Find a key and identify common chord movement from a recording.', 2, 35, 84.0, 4.8),
  ('Performance recovery', 'performance-recovery', 'Continue musically after a missed chord or rhythm break.', 2, 20, 91.0, 4.9)
) AS technique(title, slug, description, difficulty, minutes, popularity, rating)
WHERE h.slug = 'guitar'
ON CONFLICT (hobby_id, slug) DO NOTHING;

INSERT INTO technique_levels (technique_id, level_id)
SELECT t.id, l.id FROM techniques t JOIN hobbies h ON h.id=t.hobby_id JOIN hobby_levels l ON l.hobby_id=h.id
WHERE h.slug='guitar' AND ((t.difficulty_level=1 AND l.level_order=1) OR (t.difficulty_level=2 AND l.level_order IN (1,2)))
ON CONFLICT DO NOTHING;

INSERT INTO technique_prerequisites (technique_id, prerequisite_technique_id)
SELECT technique.id, prerequisite.id FROM techniques technique JOIN techniques prerequisite ON prerequisite.hobby_id=technique.hobby_id JOIN hobbies h ON h.id=technique.hobby_id
WHERE h.slug='guitar' AND (technique.slug, prerequisite.slug) IN (('pocket-strumming','clean-chord-changes'),('dynamic-control','pocket-strumming'),('suspended-chord-movement','clean-chord-changes'),('play-a-complete-song','pocket-strumming'),('performance-recovery','pocket-strumming'))
ON CONFLICT DO NOTHING;

INSERT INTO learning_resources (technique_id, title, description, resource_type, content, duration_minutes, source_name, display_order)
SELECT t.id, 'Quick guide: ' || t.title, 'A concise explanation followed by one focused practice instruction.', CASE WHEN h.slug='guitar' THEN 'exercise'::resource_type ELSE 'article'::resource_type END, CASE WHEN h.slug='guitar' THEN 'Practise slowly for five clean repetitions. Increase speed only while the motion remains relaxed and controlled.' ELSE 'Study one example, name the tactical or strategic signal, then find the same signal in a position from your own game.' END, LEAST(t.estimated_minutes,15), 'Mosaic original', 1
FROM techniques t JOIN hobbies h ON h.id=t.hobby_id
WHERE h.slug IN ('chess','guitar')
  AND NOT EXISTS (SELECT 1 FROM learning_resources resource WHERE resource.technique_id=t.id AND resource.display_order=1);
