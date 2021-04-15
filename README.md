* [[hogg]] - универсальное отражение реляционной БД
* on base `tsdx` https://github.com/formium/tsdx

# Как использовать
* пример
```typescript
  // создать экземпляр желаемого *коннектора, например HoggConnectorAirtable
  const air = new HoggConnectorAirtable()
  
  // выполняем базовую инициализацию "соединения". 
  // Опции зависят от выбранного "соединения" (см. документацию init() конкретного "соединения")
  air.init({apiKey: '<<<API_KEY>>>'})
  
  // конфигурируем другие параметры *коннектора
  const conn: HoggConnectorNT[] = air
    .db('<<<DB_NAME>>>')  // указать имя БД
    .table('users')           // указать имя таблицы
    .columns(['name', 'order'])  // имена колонок значения которых мы хотим получить (если такой колонки нет, то ошибки не будет)

  // когда *коннектор настроен, выполняем необходимые CRUD операции (см. ниже) ...

  // получение данных
  const tuples: HoggTupleNT[] = await conn.query(new HoggOffsetCount(true))
```

# Понятия
* *источник, *data-source - источных данных
* *к-имплемент, *коннектор - сущность имплементирующая интерфейс HoggConnectorNT, например HoggConnectorAirtable()
* *tuple - 

# Перед коммитом
* проверить `// TODO secret`
* поудалять `// del+`

# Ссылки
* https://itnext.io/testing-with-jest-in-typescript-cc1cd0095421 - 'Testing with jest in TypeScript'

