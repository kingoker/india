-- =====================================================================
-- Отзывы: рейтинг, видео, модерация пользовательских отзывов.
-- Пользователь может ОТПРАВИТЬ отзыв (anon insert), но только как
-- неопубликованный черновик (is_active=false, status='pending').
-- Публикует его модератор из админки, выставив is_active=true.
-- =====================================================================

alter table yagya.reviews add column if not exists rating    int;
alter table yagya.reviews add column if not exists video_url text;
alter table yagya.reviews add column if not exists contact   text;
alter table yagya.reviews add column if not exists status    text default 'pending';

-- Существующие/сидовые отзывы считаем уже одобренными.
update yagya.reviews set status = 'approved' where status is null;

create index if not exists reviews_created_idx on yagya.reviews (created_at desc);

-- Публичное чтение — только активные и одобренные (совместимо со старыми строками).
drop policy if exists "public read reviews" on yagya.reviews;
create policy "public read reviews" on yagya.reviews
  for select using (is_active and coalesce(status, 'approved') = 'approved');

-- Любой может ОТПРАВИТЬ отзыв, но строго как черновик на модерации.
drop policy if exists "anyone can submit reviews" on yagya.reviews;
create policy "anyone can submit reviews" on yagya.reviews
  for insert with check (is_active = false and status = 'pending');
