-- =====================================================================
-- Согласие на обработку персональных данных (152-ФЗ, ст. 9).
-- Оператор обязан уметь доказать, что согласие получено: храним момент
-- отметки в форме и версию документа (LEGAL_VERSION в useLegal.ts).
-- ПРИМЕНИТЬ ДО деплоя кода, который пишет эти колонки, иначе вставка в БД
-- будет падать (заявка при этом всё равно уйдёт в Telegram).
-- =====================================================================

alter table yagya.leads   add column if not exists consent_at      timestamptz;
alter table yagya.leads   add column if not exists consent_version text;
alter table yagya.reviews add column if not exists consent_at      timestamptz;
alter table yagya.reviews add column if not exists consent_version text;
