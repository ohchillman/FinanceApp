# Исправление путей импорта в компонентах expense

## Выявленные проблемы

После предыдущих исправлений путей импорта в компонентах common, была обнаружена аналогичная проблема в компонентах директории expense:

```
Unable to resolve module ../constants/colors from /Users/ohchillman/Documents/FinanceApp/src/components/expense/AmountInput.js: 

None of these files exist:
  * src/components/constants/colors(.ios.ts|.native.ts|.ts|.ios.tsx|.native.tsx|.tsx|.ios.mjs|.native.mjs|.mjs|.ios.js|.native.js|.js|.ios.jsx|.native.jsx|.jsx|.ios.json|.native.json|.json|.ios.cjs|.native.cjs|.cjs|.ios.scss|.native.scss|.scss|.ios.sass|.native.sass|.sass|.ios.css|.native.css|.css)
  * src/components/constants/colors
```

Проблема заключается в том, что компоненты в директории `src/components/expense` пытаются импортировать константы из `../constants/colors`, но такого пути не существует относительно директории компонентов. Директория constants находится на уровне src, а не внутри директории components.

## Исправленные файлы

Были исправлены следующие файлы в директории `src/components/expense`:

1. **AmountInput.js** - исправлены пути импорта констант
2. **CategoryItem.js** - исправлены пути импорта констант
3. **CategorySelector.js** - исправлены пути импорта констант
4. **ExpenseForm.js** - исправлены пути импорта констант и добавлен импорт TextInput
5. **ExpenseItem.js** - исправлены пути импорта констант

## Внесенные изменения

Во всех файлах были изменены пути импорта с:

```javascript
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';
```

на:

```javascript
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
```

Это правильный путь, так как директория constants находится на уровне src, а не внутри директории components. Поэтому для компонентов в src/components/expense нужно подняться на два уровня вверх (../../), а затем перейти в директорию constants.

## Дополнительные исправления

В файле ExpenseForm.js был также добавлен отсутствующий импорт компонента TextInput:

```javascript
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
```

## Результат

После внесения этих исправлений, все компоненты в директории expense должны корректно импортировать константы из директории constants, и приложение должно запускаться без ошибок импорта.
