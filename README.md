* [[hogg]] - универсальное отражение реляционной БД
* on base `tsdx` https://github.com/formium/tsdx
* плато понятий - база данных, таблица, ряд, столбец, ячейка, ...

# Как использовать
* пример
```typescript
  // создать экземпляр желаемого "соединения", например HoggConnectionAirtable
  const air = new HoggConnectionAirtable()
  
  // выполняем базовую инициализацию "соединения". 
  // Опции зависят от выбранного "соединения" (см. документацию init() конкретного "соединения")
  air.init({apiKey: 'keyzbjTYgu52lb9D3'})
  
  // конфигурируем другие параметры "соединения"
  const conn: HoggConnectionNT[] = air
    .db('app9g4lkKDZ434P1P')  // указать имя БД
    .table('users')           // указать имя таблицы
    .columns(['name', 'order'])  // (опционально) имена колонок значения которых мы хотим получить (если не указано то означает получить все колонки)

  // когда "соединение" настроено, выполняем необходимые CRUD операции (см. ниже) ...

  // получение данных
  const tuples: HoggTupleNT[] = await conn.query(new HoggOffsetCount(true))
```

# Перед коммитом
* проверить `// TODO secret`
* поудалять `// del+`

# Ссылки
* https://itnext.io/testing-with-jest-in-typescript-cc1cd0095421 - 'Testing with jest in TypeScript'

