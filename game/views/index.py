from django.shortcuts import render


def index(request):
    return render(request, "multiplayer/web.html")

