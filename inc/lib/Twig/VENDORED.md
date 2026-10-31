[Twig 1.44.8](https://github.com/twigphp/Twig/tree/v1.44.8).

The upstream `lib/Twig` files retain the `Twig_` class names. The upstream
`src` directory supplies their implementations. The local `autoload.php`
loads both layouts without Composer. PHP must have the ctype extension.

The three i18n classes under `Extensions` come from
[twig/extensions 1.5.4](https://github.com/twigphp/Twig-extensions/tree/v1.5.4).

`Extensions/Extension/Tinyboard.php` belongs to Fukuro.
