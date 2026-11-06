-- 2026-11-02: give the hand-checked DeepSeek labels their own split.
--
-- Run once on a database created before this split existed, then run
-- scripts/07_load_labels.py to move those rows out of 'answer_key'.
alter table reviews drop constraint reviews_label_split_check;
alter table reviews add constraint reviews_label_split_check
    check (label_split in ('answer_key','spot_check','train','val','test','unlabeled'));
