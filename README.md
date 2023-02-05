Универсальное отражение реляционной БД

# Как использовать
* пример
```typescript
  // создать экземпляр желаемого *коннектора, например HoggConnectorAirtable
  const air: HoggConnectorAirtable = new HoggConnectorAirtable()
  
  // выполняем базовую инициализацию "коннектора". 
  // Опции зависят от выбранного "коннектора" (см. документацию init() конкретного "коннектора")
  air.init({apiKey: '<<<API_KEY>>>'});
  
  // конфигурируем другие параметры *коннектора
  const conn: HoggConnectorNT = air
    .db('<<<DB_NAME>>>')  // указать имя БД, например 'appL0eof6VFTiPyjm'
    .table('<<<TABLE_NAME>>>')           // указать имя таблицы
    .columns(['name', 'order'])  // имена колонок значения которых мы хотим получить (если такой колонки нет, то ошибки не будет)

  // когда *коннектор настроен, выполняем необходимые CRUD операции (см. ниже) ...

  // получение данных
  const tuples: HoggTupleNT[] = await conn.query(new HoggOffsetCount(true))
```

# Технологии
* TypeScript, JavaScript

# Понятия
* *источник, *data-source - источных данных
* *к-имплемент, *коннектор - сущность имплементирующая интерфейс HoggConnectorNT, например HoggConnectorAirtable()
* *кортеж, *tuple - коллекция *ячеек
* *ячейка, *cell - 
* [vusc] - фильтр для данных, как у Airtable API ([link](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference))

# Перед коммитом
* проверить `// TODO secret`
* поудалять `// del+`

# Ссылки
* https://github.com/formium/tsdx
* https://itnext.io/testing-with-jest-in-typescript-cc1cd0095421 - 'Testing with jest in TypeScript'

# История версий
- 2023-02-05 2.11.0 => 3.0.0 изменена функция delete (src/connections/HoggConnectorAirtable.ts:350) с тем чтобы поддерживала удаление более 10 записей
