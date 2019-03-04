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
  <li>
    <a href="{{ talk.url }}">{{ talk.location }} - {{ talk.name }}</a>
  </li>
{% endfor %}

## Open Source Contributions

{% for o in site.oss %}
  <li>
    <a href="{{ o.url }}">{{ o.name }} - {{ o.commitRef }}</a>
  </li>
{% endfor %}


## Tech

You can find my dotfiles here: <a href="http://github.com/chris-bacon/config">dotfiles</a>

These are the technologies that I use professionally and personally:

{% for tech in site.technologies %}
  <li>
    {{ tech }}
  </li>
{% endfor %}
