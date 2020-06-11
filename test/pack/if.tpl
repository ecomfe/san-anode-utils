<div>
<nav s-if="a"><a>aa<b>bb</b></a></nav>
<ul s-elif="b"></ul>
<div s-else-if="c">
  <a>aa
    <b>bb</b>
    <span>text<del>bb</del>tex2</span>
  </a>
</div>
<u s-else>bb</u>
</div>