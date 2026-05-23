from django.urls import path
from feed.views import FeedListView

urlpatterns = [
    path("feed/", FeedListView.as_view(), name="feed"),
]