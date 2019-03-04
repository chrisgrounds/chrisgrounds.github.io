---
---

{% include css.html %}

# Welcome

I'm a Software Engineer at <a href="https://www.tracsis.com/">Tracsis</a>, formerly at the <a href="https://www.bbc.co.uk">BBC</a>, interested in functional programming and software engineering best practice and excellence.
  
## Blog 
 
{% if site.posts.size == 0 %}
  No blog posts found
{% else %}
  <ul>
    {% for post in site.posts %}
      <li>
        <a href="{{ post.url }}">{{ post.date | date_to_string }} - {{ post.title }}</a>
      </li>
    {% endfor %}
  </ul>
{% endif %}

## Talks

{% for talk in site.talks %}
  {{ talk.location }}
  <li>
    <a href="{{ talk.url }}">{{ talk.location }} - {{ talk.name }}</a>
  </li>
{% endfor %}

## Open Source Contributions

- GHC: <a href="https://github.com/ghc/ghc/commit/36c1431d9d2d06049190cc0888dbfaee8e2179d6">36c1431d9d2d06049190cc0888dbfaee8e2179d6</a>
- Vim-one: colorschemes for Vim: <a href="https://github.com/rakr/vim-one/commit/8e1118ecec916e1334694a44ef29db70fb679682">8e1118ecec916e1334694a44ef29db70fb679682</a>
- Intero-neovim: an intero plugin for neovim: <a href="https://github.com/parsonsmatt/intero-neovim/commit/26d340ab0d6e8d40cbafaf72dac0588ae901c117">26d340ab0d6e8d40cbafaf72dac0588ae901c117</a>

## Tech

You can find my dotfiles here: <a href="http://github.com/chris-bacon/config">dotfiles</a>

These are the technologies that I use professionally and personally:

{% for tech in site.technologies %}
  - {{ tech }}
{% endfor %}
