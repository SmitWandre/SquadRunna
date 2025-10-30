from rest_framework import permissions, response
from rest_framework.views import APIView
from .closeout import closeout_week

class DebugCloseoutView(APIView):
    """
    Endpoint to manually trigger weekly closeout for testing.
    In production, this should be staff-only.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # For testing: allow any authenticated user
        # In production: uncomment the staff check below
        # if not request.user.is_staff:
        #     return response.Response({"detail": "Not allowed"}, status=403)

        try:
            # Check if we should test current week (for immediate testing)
            test_current = request.data.get('test_current_week', False)

            closeout_week(test_current_week=test_current)

            week_type = "current" if test_current else "previous"
            return response.Response({
                "status": "closeout complete",
                "message": f"Weekly goals closed out and points awarded ({week_type} week)"
            })
        except Exception as e:
            return response.Response({
                "status": "error",
                "message": str(e)
            }, status=500)
