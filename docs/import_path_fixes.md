# Исправление путей импорта в компонентах

## Выявленная проблема

После предыдущих исправлений возникла новая ошибка при запуске приложения:

```
Unable to resolve module ../constants/colors from /Users/ohchillman/Documents/FinanceApp/src/components/common/Button.js: 

None of these files exist:
  * src/components/constants/colors(.ios.ts|.native.ts|.ts|.ios.tsx|.native.tsx|.tsx|.ios.mjs|.native.mjs|.mjs|.ios.js|.native.js|.js|.ios.jsx|.native.jsx|.jsx|.ios.json|.native.json|.json|.ios.cjs|.native.cjs|.cjs|.ios.scss|.native.scss|.scss|.ios.sass|.native.sass|.sass|.ios.css|.native.css|.css)
  * src/components/constants/colors
```

Проблема заключается в неправильных путях импорта в компонентах. Компоненты в директории `src/components/common` пытаются импортировать константы из `../constants/colors`, но такого пути не существует относительно директории компонентов.

## Внесенные исправления

Исправлены пути импорта в следующих файлах:

### 1. Button.js

Было:
```javascript
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';
```

Стало:
```javascript
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
```

### 2. Input.js

Было:
```javascript
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';
```

Стало:
```javascript
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
```

### 3. Card.js

Было:
```javascript
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';
```

Стало:
```javascript
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
```

## Объяснение исправления

Директория `constants` находится на уровне `src`, а не внутри директории `components`. Поэтому для компонентов в `src/components/common` правильный путь к константам должен быть `../../constants/colors` (подняться на два уровня вверх, а затем перейти в директорию constants).

Структура проекта:
```
src/
├── components/
│   └── common/
│       ├── Button.js
│       ├── Card.js
│       └── Input.js
├── constants/
│   ├── colors.js
│   └── dimensions.js
└── ...
```
