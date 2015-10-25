# API Reference
**base type:** `ui-seed`

A database of family members, family tress, addresses, etc

## Usage

### Comment with optional footer

```html
<rcm-comment>
 <rcm-comment-content>
   <h2>Comment headline</h2>
   <p>Comment content</p>
 </rcm-comment-content>
 <rcm-comment-footer>
   Comment footer
 </rcm-comment-footer>
</rcm-comment>
```

### Comment with actions

```html
<rcm-comment>
 <rcm-comment-content>
   <h2>Comment headline</h2>
   <p>Comment content</p>
 </rcm-comment-content>
 <div class="md-actions" layout="row" layout-align="end center">
   <md-button>Action 1</md-button>
   <md-button>Action 2</md-button>
 </div>
</md-card>
```

## Attributes

| Parameter   | Type       | Description                            |
|-------------|------------|----------------------------------------|
| md-no-ink   | boolean    | If present, disable ripple ink effects |
| ng-disabled | expression | En/Disable based on the expression     |
| ng-model    | string     | Assignable angular expression to data-bind to |


## Notes
