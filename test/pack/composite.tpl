<div class="editor-page">
  <div class="container page">
    <div class="row">
      <div class="col-md-10 offset-md-1 col-xs-12">
        <x-errors />
        <form on-submit="prevent:onPublish">
          <fieldset disabled="{{inProgress}}">
            <fieldset class="form-group">
              <input type="text" class="form-control form-control-lg" value="{=article.title=}" placeholder="Article Title">
            </fieldset>
            <fieldset class="form-group">
              <input type="text" class="form-control" value="{=article.description=}" placeholder="What's this article about?">
            </fieldset>
            <fieldset class="form-group">
              <textarea class="form-control" rows="8" value="{=article.body=}"
                placeholder="Write your article (in markdown)"
              >
              </textarea>
            </fieldset>
            <fieldset class="form-group">
              <input type="text" class="form-control" placeholder="Enter tags" value="{=tagInput=}" on-keypress="addTag">
              <div class="tag-list">
                <span class="tag-default tag-pill" s-for="tag in article.tagList">
                  <i class="ion-close-round" on-click="removeTag(tag)"></i>
                  {{ tag }}
                </span>
              </div>
            </fieldset>
          </fieldset>
          <button disabled="{{inProgress}}" class="btn btn-lg pull-xs-right btn-primary">
            Publish Article
          </button>
        </form>
      </div>
    </div>
  </div>
</div>