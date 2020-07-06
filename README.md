# strava-gdoc-sync
Sync Strava activities to training plan in Google Document 


## Установка
1. Создать документ в Google Docs с единственной таблицей с минимум 3 колонками.

Дата | Описание | Strava 
--|--|---
22.05.2020 <обязательно в таком формате> | Тренировка | <сюда загрузится тренировка из Strava>

2. Меню Tools - Script Editor
3. Откроется окно с файлом `Code.gs`. Вставить туда содержимое - https://raw.githubusercontent.com/Diozavr/strava-gdoc-sync/master/code.gs
4. В этом же окне открыть меню Resources - Libraries, добавить библиотеку - Add a library: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF , выбрать последнюю версию (38) и сохранить.
5. Переключиться в документ и обновить. В окне документа в меню появится пункт Strava App - Sync data
6. Запустить Sync data. Первый раз будет 2 акна авторизации - сначала для Google, потом для Strava. После прохождения авторизации нужно заново запустить Synс data.

## Ограничения
* Каждый раз все значения в третьем столбце перезаписываются поверх
* Обрабатываются тренировки не старше 31 дня
