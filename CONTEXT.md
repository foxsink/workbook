# Текущий контекст

## Текущая задача
- ID: Phase 2.1 -- Теги
- Статус: done
- Описание: Tag<->Material many-to-many, CRUD API, TagBadge, TagSelect, фильтрация по тегам

## Что сделано на этом шаге

### Prisma schema
- Добавлена связь `tags Tag[]` в Material и `materials Material[]` в Tag (implicit many-to-many)
- Миграция `add-tag-material-relation` -- создана join-таблица `_MaterialToTag`

### Server API (server/api/tags/)
- `index.get.ts` -- список тегов с `_count.materials`
- `index.post.ts` -- создание тега (upsert: если существует, возвращает существующий)
- `[id].put.ts` -- обновление имени/цвета
- `[id].delete.ts` -- удаление тега

### Обновлённые materials API
- `index.get.ts` -- фильтрация по `tagId` через `tags: { some: { id: tagId } }`, include tags
- `index.post.ts` -- `tagIds` при создании через `tags: { connect: [...] }`
- `[id].get.ts` -- include tags
- `[id].put.ts` -- `tagIds` через `tags: { set: [...] }` (замена всех тегов)

### FSD entity tag
- `app/entities/tag/model/types.ts` -- Tag, CreateTagDTO, UpdateTagDTO
- `app/entities/tag/api/tag.api.ts` -- getAll, create, update, remove
- `app/entities/tag/ui/TagBadge.vue` -- цветной badge с динамическим style (color из БД), опционально removable
- `app/entities/tag/index.ts` -- public API

### Feature manage-tags
- `app/features/manage-tags/model/useTags.ts` -- composable (fetchTags, createTag, removeTag)
- `app/features/manage-tags/ui/TagSelect.vue` -- combobox-like UI: поиск, выбор существующих, создание новых inline, рандомные цвета
- `app/features/manage-tags/index.ts`

### Обновлённые компоненты
- `Material.types.ts` -- добавлено `tags?: Tag[]` и `tagIds?: string[]` в DTO
- `material.api.ts` -- `getAll(folderId?, tagId?)` с query params
- `CreateMaterialForm.vue` -- TagSelect для назначения тегов при создании
- `useCreateMaterial.ts` -- form.tagIds, передача в API
- `MaterialCard.vue` -- показывает теги через TagBadge
- `MaterialsList.vue` -- панель фильтрации по тегам (клик по тегу -> фильтр, повторный клик -> сброс)
- `materials/[id].vue` -- показывает теги в header + inline TagSelect для редактирования

## Выполненные фазы

### Phase 1 (done) -- MVP
- Nuxt 4, NuxtUI v4, PostgreSQL, Prisma 7, FSD
- CRUD: materials, notes, folders, timestamps
- Milkdown редактор с автосохранением
- Видеоплеер (Plyr) + split-view + таймкоды (@[MM:SS])
- Адаптивная верстка, PWA meta

### Phase 2.1 (done) -- Теги

## Проблемы и решения
- vue-plyr -> plyr (Vue 2 зависимость)
- Prisma 7: url deprecated -> prisma.config.ts
- kill на порту убивает браузер -> pkill -f "nuxt dev"
- Milkdown SSR -> ClientOnly + defineAsyncComponent
- form.tagIds! в Vue-шаблоне -> :model-value + @update:model-value (TS non-null assertion не работает в template)
- inject() в callback handleMaterialCreated -> использовать ref напрямую (inject ищет в родителе, не в текущем компоненте)
- MaterialsList не регистрировал refresh -> inject('refreshMaterials') + onMounted установка
- Создание заметки без имени -> UPopover с UInput перед созданием, fallback на "Заметка N"

## Dev server
- URL: http://localhost:3000
- Остановка: pkill -f "nuxt dev" (НЕ kill на порту!)

## Следующий шаг
- Phase 2.2: Полнотекстовый поиск (PostgreSQL tsvector/tsquery, API, UI поисковой строки)
- Phase 2.3: Парсинг метаданных по URL
- Phase 2.4: Загрузка файлов

## Ключевые файлы
- prisma/schema.prisma -- Tag<->Material many-to-many
- server/api/tags/ -- CRUD тегов
- server/api/materials/ -- обновлены include tags, фильтрация, tagIds
- app/entities/tag/ -- types, API, TagBadge
- app/features/manage-tags/ -- useTags, TagSelect
- app/features/create-material/ -- обновлён с тегами
- app/entities/material/ui/MaterialCard.vue -- показывает теги
- app/widgets/materials-list/ui/MaterialsList.vue -- фильтрация по тегам
- app/pages/materials/[id].vue -- теги в header + редактирование
